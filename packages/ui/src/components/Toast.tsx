/**
 * Toast component
 *
 * Temporary notification that appears at the bottom of the screen.
 * Auto-dismisses after a timeout and supports actions.
 */

import type { ReactNode} from 'react';
import { useCallback, useEffect, useState } from 'react';
import type { GetProps } from 'tamagui';
import { styled, Stack, XStack } from 'tamagui';

import { Text } from '../primitives/Text';

/**
 * Toast variant types
 */
export type ToastVariant = 'default' | 'success' | 'warning' | 'error';

/**
 * Toast duration presets (in ms)
 */
export const TOAST_DURATION = {
  short: 2000,
  medium: 4000,
  long: 6000,
} as const;

/**
 * Toast frame
 */
const ToastFrame = styled(Stack, {
  name: 'Toast',

  paddingHorizontal: '$4',
  paddingVertical: '$3',
  borderRadius: '$3',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '$3',
  maxWidth: 400,
  minWidth: 200,

  // Shadow for elevation effect
  shadowColor: '$shadowColor',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 8,

  // Animation
  animation: 'toast',
  opacity: 1,
  y: 0,

  enterStyle: {
    opacity: 0,
    y: 20,
  },

  exitStyle: {
    opacity: 0,
    y: 20,
  },

  variants: {
    /**
     * Toast variants
     */
    variant: {
      default: {
        backgroundColor: '$surface',
        borderWidth: 1,
        borderColor: '$border',
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

  defaultVariants: {
    variant: 'default',
  },
});

/**
 * Toast content container
 */
const ToastContent = styled(XStack, {
  name: 'ToastContent',

  flex: 1,
  alignItems: 'center',
  gap: '$2',
});

/**
 * Toast text
 */
const ToastText = styled(Text, {
  name: 'ToastText',

  flex: 1,
  fontSize: '$4',

  variants: {
    toastVariant: {
      default: {
        color: '$textPrimary',
      },
      success: {
        color: '$white',
      },
      warning: {
        color: '$white',
      },
      error: {
        color: '$white',
      },
    },
  } as const,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

/**
 * Toast action button
 */
const ToastAction = styled(Stack, {
  name: 'ToastAction',

  paddingHorizontal: '$2',
  paddingVertical: '$1',
  borderRadius: '$1',
  cursor: 'pointer',

  pressStyle: {
    opacity: 0.8,
  },

  variants: {
    variant: {
      default: {
        backgroundColor: '$primary',
      },
      success: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
      warning: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
      error: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
      },
    },
  } as const,
});

export type ToastFrameProps = GetProps<typeof ToastFrame>;

export interface ToastProps extends Omit<ToastFrameProps, 'variant'> {
  /** Toast variant */
  variant?: ToastVariant;
  /** Toast message */
  message: string;
  /** Optional icon */
  icon?: ReactNode;
  /** Action button text */
  actionText?: string;
  /** Action button callback */
  onAction?: () => void;
  /** Duration before auto-dismiss (ms) */
  duration?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Whether to show the toast */
  visible?: boolean;
}

/**
 * Toast component
 */
export function Toast({
  variant = 'default',
  message,
  icon,
  actionText,
  onAction,
  duration = TOAST_DURATION.medium,
  onDismiss,
  visible = true,
  ...frameProps
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible);

  // Handle auto-dismiss
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onDismiss) {
          onDismiss();
        }
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onDismiss]);

  // Sync with external visible prop
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  const handleAction = useCallback(() => {
    if (onAction) {
      onAction();
    }
    // Optionally dismiss after action
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  }, [onAction, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <ToastFrame variant={variant} {...frameProps}>
      <ToastContent>
        {icon}
        <ToastText toastVariant={variant}>{message}</ToastText>
      </ToastContent>

      {actionText && (
        <ToastAction variant={variant} onPress={handleAction}>
          <Text
            variant="button"
            style={{
              color: variant === 'default' ? 'white' : 'white',
              fontSize: 13,
            }}
          >
            {actionText}
          </Text>
        </ToastAction>
      )}
    </ToastFrame>
  );
}

/**
 * Toast container for positioning at bottom of screen
 */
const ToastContainer = styled(Stack, {
  name: 'ToastContainer',

  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  alignItems: 'center',
  padding: '$4',
  paddingBottom: '$8', // Extra padding for safe area
  pointerEvents: 'box-none',

  // Stack multiple toasts
  gap: '$2',
});

/**
 * Toast queue state
 */
export interface ToastItem {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  actionText?: string;
  onAction?: () => void;
}

export interface ToastProviderProps {
  children?: ReactNode;
}

// Sub-components
Toast.Frame = ToastFrame;
Toast.Content = ToastContent;
Toast.Text = ToastText;
Toast.Action = ToastAction;
Toast.Container = ToastContainer;

export { ToastFrame, ToastContent, ToastText, ToastAction, ToastContainer };
