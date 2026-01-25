/**
 * Banner component
 *
 * Full-width message banner for announcements, warnings, and status messages.
 * Supports different variants and dismissible functionality.
 */

import type { ReactNode} from 'react';
import { useCallback } from 'react';
import type { GetProps } from 'tamagui';
import { styled, Stack, XStack } from 'tamagui';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';

/**
 * Banner variant types
 */
export type BannerVariant = 'info' | 'success' | 'warning' | 'error';

/**
 * Banner frame
 */
const BannerFrame = styled(Stack, {
  name: 'Banner',

  width: '100%',
  padding: '$3',
  borderRadius: '$2',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',

  // Animation for appearance
  animation: 'medium',
  opacity: 1,

  enterStyle: {
    opacity: 0,
    y: -10,
  },

  exitStyle: {
    opacity: 0,
    y: -10,
  },

  variants: {
    /**
     * Banner variants
     */
    variant: {
      info: {
        backgroundColor: '$primary',
        borderColor: '$primary',
      },

      success: {
        backgroundColor: '$successBackground',
        borderColor: '$successBorder',
        borderWidth: 1,
      },

      warning: {
        backgroundColor: '$warningBackground',
        borderColor: '$warningBorder',
        borderWidth: 1,
      },

      error: {
        backgroundColor: '$errorBackground',
        borderColor: '$errorBorder',
        borderWidth: 1,
      },
    },

    /**
     * Full bleed (no border radius, for top of screen)
     */
    fullBleed: {
      true: {
        borderRadius: 0,
      },
    },

    /**
     * Compact size
     */
    compact: {
      true: {
        padding: '$2',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'info',
  },
});

/**
 * Banner content container
 */
const BannerContent = styled(XStack, {
  name: 'BannerContent',

  flex: 1,
  alignItems: 'center',
  gap: '$2',
});

/**
 * Banner text
 */
const BannerText = styled(Text, {
  name: 'BannerText',

  flex: 1,

  variants: {
    bannerVariant: {
      info: {
        color: '$white',
      },
      success: {
        color: '$success',
      },
      warning: {
        color: '$warning',
      },
      error: {
        color: '$error',
      },
    },
  } as const,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

/**
 * Dismiss button
 */
const DismissButton = styled(Stack, {
  name: 'BannerDismiss',

  padding: '$1',
  borderRadius: '$1',
  cursor: 'pointer',

  pressStyle: {
    opacity: 0.7,
  },

  hoverStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

export type BannerFrameProps = GetProps<typeof BannerFrame>;

export interface BannerProps extends Omit<BannerFrameProps, 'variant'> {
  /** Banner variant */
  variant?: BannerVariant;
  /** Banner message */
  message: string;
  /** Optional title */
  title?: string;
  /** Left icon */
  icon?: ReactNode;
  /** Whether the banner can be dismissed */
  dismissible?: boolean;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
}

/**
 * Banner component
 */
export function Banner({
  variant = 'info',
  message,
  title,
  icon,
  dismissible = false,
  onDismiss,
  actionText,
  onAction,
  ...frameProps
}: BannerProps) {
  const handleDismiss = useCallback(() => {
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  return (
    <BannerFrame variant={variant} {...frameProps}>
      <BannerContent>
        {icon}

        <Stack flex={1}>
          {title && (
            <BannerText bannerVariant={variant} weight="semibold">
              {title}
            </BannerText>
          )}
          <BannerText bannerVariant={variant}>
            {message}
          </BannerText>
        </Stack>
      </BannerContent>

      <XStack gap="$2" alignItems="center">
        {actionText && onAction && (
          <Button
            size="sm"
            variant={variant === 'info' ? 'secondary' : 'ghost'}
            onPress={onAction}
          >
            {actionText}
          </Button>
        )}

        {dismissible && (
          <DismissButton onPress={handleDismiss} accessibilityLabel="Dismiss banner">
            <Text
              style={{
                color: variant === 'info' ? 'white' : undefined,
                fontSize: 18,
              }}
            >
              x
            </Text>
          </DismissButton>
        )}
      </XStack>
    </BannerFrame>
  );
}

// Export frame for composition
Banner.Frame = BannerFrame;
Banner.Content = BannerContent;
Banner.Text = BannerText;

export { BannerFrame, BannerContent, BannerText };
