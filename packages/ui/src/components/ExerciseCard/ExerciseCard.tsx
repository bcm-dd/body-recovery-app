/**
 * ExerciseCard component
 *
 * Displays an exercise with:
 * - Exercise name and video placeholder
 * - Set circles for progress tracking
 * - Tap to complete set
 * - Long-press for swap
 * - Pain status indicator
 */

import { styled, Stack, XStack, YStack, GetProps } from 'tamagui';
import { useCallback } from 'react';
import { Text, H5 } from '../../primitives/Text';
import { Card } from '../../primitives/Card';
import { SetLogger, SetData } from './SetLogger';
import { palette } from '../../theme/tokens';
import type { PainLevel } from '../BodyMap/BodyRegion';

/**
 * Exercise prescription data
 */
export interface ExercisePrescription {
  /** Number of sets */
  sets: number;
  /** Target reps per set */
  reps: number;
  /** Weight in kg (optional) */
  weight?: number;
  /** Duration in seconds (for timed exercises) */
  duration?: number;
  /** Rest time between sets in seconds */
  restSeconds?: number;
  /** Hold time in seconds (for isometric exercises) */
  holdSeconds?: number;
}

/**
 * Exercise data
 */
export interface Exercise {
  /** Unique identifier */
  id: string;
  /** Exercise name */
  name: string;
  /** Brief description or cues */
  description?: string;
  /** Video URL for demo */
  videoUrl?: string;
  /** Thumbnail image URL */
  thumbnailUrl?: string;
  /** Target muscle groups */
  targetMuscles?: string[];
  /** Equipment required */
  equipment?: string[];
}

/**
 * Exercise card status
 */
export type ExerciseStatus = 'upcoming' | 'active' | 'completed' | 'skipped';

/**
 * Video placeholder container
 */
const VideoPlaceholder = styled(Stack, {
  name: 'VideoPlaceholder',

  width: '100%',
  aspectRatio: 16 / 9,
  backgroundColor: '$surface',
  borderRadius: '$2',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',

  variants: {
    size: {
      sm: {
        aspectRatio: 4 / 3,
      },
      md: {
        aspectRatio: 16 / 9,
      },
      lg: {
        aspectRatio: 16 / 9,
      },
    },
  } as const,
});

/**
 * Pain indicator dot
 */
const PainIndicator = styled(Stack, {
  name: 'PainIndicator',

  width: 8,
  height: 8,
  borderRadius: '$full',

  variants: {
    level: {
      none: {
        backgroundColor: '$painNone',
      },
      mild: {
        backgroundColor: '$painMild',
      },
      moderate: {
        backgroundColor: '$painModerate',
      },
      severe: {
        backgroundColor: '$painSevere',
      },
    },
  } as const,
});

/**
 * Status badge
 */
const StatusBadge = styled(Stack, {
  name: 'StatusBadge',

  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$1',

  variants: {
    status: {
      upcoming: {
        backgroundColor: '$surface',
      },
      active: {
        backgroundColor: '$primary',
      },
      completed: {
        backgroundColor: '$success',
      },
      skipped: {
        backgroundColor: '$warning',
      },
    },
  } as const,
});

/**
 * Exercise card frame
 */
const ExerciseCardFrame = styled(Card, {
  name: 'ExerciseCard',

  variants: {
    status: {
      upcoming: {
        borderColor: '$border',
      },
      active: {
        borderColor: '$primary',
        borderWidth: 2,
      },
      completed: {
        opacity: 0.7,
        borderColor: '$success',
      },
      skipped: {
        opacity: 0.5,
        borderColor: '$warning',
      },
    },

    compact: {
      true: {
        padding: '$3',
      },
    },
  } as const,

  defaultVariants: {
    status: 'upcoming',
  },
});

export type ExerciseCardFrameProps = GetProps<typeof ExerciseCardFrame>;

export interface ExerciseCardProps extends ExerciseCardFrameProps {
  /** Exercise data */
  exercise: Exercise;
  /** Exercise prescription (sets, reps, weight) */
  prescription: ExercisePrescription;
  /** Completed sets data */
  completedSets?: SetData[];
  /** Current status */
  status?: ExerciseStatus;
  /** Pain level for associated body region */
  painLevel?: PainLevel;
  /** Called when the complete set button is pressed */
  onCompleteSet?: (setData: SetData) => void;
  /** Called when the card is long-pressed (for swap) */
  onSwap?: () => void;
  /** Called when the card is pressed */
  onPress?: () => void;
  /** Called when pain indicator is pressed */
  onPainPress?: () => void;
  /** Whether to show the video placeholder */
  showVideo?: boolean;
  /** Compact mode for lists */
  compact?: boolean;
  /** Whether the card is interactive */
  interactive?: boolean;
}

/**
 * ExerciseCard component
 *
 * Displays exercise details with progress tracking and interactive controls.
 */
export function ExerciseCard({
  exercise,
  prescription,
  completedSets = [],
  status = 'upcoming',
  painLevel,
  onCompleteSet,
  onSwap,
  onPress,
  onPainPress,
  showVideo = true,
  compact = false,
  interactive = true,
  ...cardProps
}: ExerciseCardProps) {
  // Handle set completion
  const handleSetTap = useCallback(
    (setIndex: number) => {
      if (!onCompleteSet || status !== 'active') return;

      const setNumber = setIndex + 1;
      const existingSet = completedSets.find((s) => s.setNumber === setNumber);

      if (!existingSet?.completed) {
        onCompleteSet({
          setNumber,
          targetReps: prescription.reps,
          actualReps: prescription.reps,
          weight: prescription.weight,
          completed: true,
        });
      }
    },
    [onCompleteSet, status, completedSets, prescription]
  );

  // Handle long press for swap
  const handleLongPress = useCallback(() => {
    if (interactive && onSwap) {
      onSwap();
    }
  }, [interactive, onSwap]);

  // Format prescription text
  const prescriptionText = formatPrescription(prescription);

  // Calculate active set index
  const activeSetIndex = completedSets.filter((s) => s.completed).length;

  return (
    <ExerciseCardFrame
      status={status}
      compact={compact}
      pressable={interactive}
      onPress={onPress}
      onLongPress={handleLongPress}
      {...cardProps}
    >
      <YStack gap="$3">
        {/* Video placeholder */}
        {showVideo && !compact && (
          <VideoPlaceholder size={compact ? 'sm' : 'md'}>
            {exercise.thumbnailUrl ? (
              // Would render actual image here
              <Text color="muted">Video</Text>
            ) : (
              <YStack alignItems="center" gap="$1">
                <Text color="muted" variant="caption">
                  Tap to play demo
                </Text>
              </YStack>
            )}
          </VideoPlaceholder>
        )}

        {/* Header with name and status */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" gap="$2" flex={1}>
            <H5 numberOfLines={1}>{exercise.name}</H5>
            {painLevel && painLevel !== 'none' && (
              <PainIndicator
                level={painLevel}
                onPress={onPainPress}
                accessibilityLabel={`Pain level: ${painLevel}`}
              />
            )}
          </XStack>

          {status !== 'upcoming' && (
            <StatusBadge status={status}>
              <Text variant="captionSmall" color="primary">
                {status === 'active' ? 'Current' : status === 'completed' ? 'Done' : 'Skipped'}
              </Text>
            </StatusBadge>
          )}
        </XStack>

        {/* Prescription */}
        <Text variant="body" color="secondary">
          {prescriptionText}
        </Text>

        {/* Description/cues (if not compact) */}
        {!compact && exercise.description && (
          <Text variant="bodySmall" color="muted" numberOfLines={2}>
            {exercise.description}
          </Text>
        )}

        {/* Set progress */}
        <XStack justifyContent="space-between" alignItems="center">
          <SetLogger
            totalSets={prescription.sets}
            completedSets={completedSets}
            activeSetIndex={activeSetIndex}
            onSetTap={handleSetTap}
            interactive={interactive && status === 'active'}
            size={compact ? 'sm' : 'md'}
          />

          {!compact && (
            <SetLogger.ProgressText
              completedCount={completedSets.filter((s) => s.completed).length}
              totalSets={prescription.sets}
            />
          )}
        </XStack>
      </YStack>
    </ExerciseCardFrame>
  );
}

/**
 * Format prescription into readable text
 */
function formatPrescription(prescription: ExercisePrescription): string {
  const parts: string[] = [];

  if (prescription.weight) {
    parts.push(`${prescription.weight}kg`);
  }

  if (prescription.duration) {
    parts.push(`${prescription.duration}s`);
  } else if (prescription.holdSeconds) {
    parts.push(`${prescription.holdSeconds}s hold`);
  } else {
    parts.push(`${prescription.reps} reps`);
  }

  parts.push(`${prescription.sets} sets`);

  if (prescription.restSeconds) {
    parts.push(`${prescription.restSeconds}s rest`);
  }

  return parts.join(' x ');
}

// Sub-components
ExerciseCard.Frame = ExerciseCardFrame;
ExerciseCard.VideoPlaceholder = VideoPlaceholder;
ExerciseCard.PainIndicator = PainIndicator;
ExerciseCard.StatusBadge = StatusBadge;
ExerciseCard.SetLogger = SetLogger;

export { ExerciseCardFrame, VideoPlaceholder, PainIndicator, StatusBadge };
