/**
 * Button primitive component
 *
 * A styled button with variants for primary, secondary, ghost, and destructive actions.
 * Supports multiple sizes and loading states.
 */

import type { ReactNode } from 'react';
import type { GetProps} from 'tamagui';
import { styled, Stack, Text } from 'tamagui';

/**
 * Base button frame
 */
const ButtonFrame = styled(Stack, {
  name: 'Button',
  tag: 'button',
  role: 'button',
  focusable: true,

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$2',

  borderWidth: 1,
  borderColor: 'transparent',

  cursor: 'pointer',
  userSelect: 'none',

  // Animation
  animation: 'quick',

  // Default state
  backgroundColor: '$primary',
  borderRadius: '$2',
  paddingHorizontal: '$4',
  paddingVertical: '$3',

  // Pressed/hover states
  pressStyle: {
    opacity: 0.9,
    scale: 0.98,
  },

  hoverStyle: {
    backgroundColor: '$primaryHover',
  },

  focusStyle: {
    outlineWidth: 2,
    outlineColor: '$primary',
    outlineStyle: 'solid',
    outlineOffset: 2,
  },

  // Disabled state
  disabledStyle: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },

  variants: {
    /**
     * Button variants
     */
    variant: {
      primary: {
        backgroundColor: '$primary',
        hoverStyle: {
          backgroundColor: '$primaryHover',
        },
        pressStyle: {
          backgroundColor: '$primaryPress',
        },
      },

      secondary: {
        backgroundColor: '$surface',
        borderColor: '$border',
        hoverStyle: {
          backgroundColor: '$surfaceHover',
          borderColor: '$borderHover',
        },
        pressStyle: {
          backgroundColor: '$surfacePress',
        },
      },

      ghost: {
        backgroundColor: 'transparent',
        hoverStyle: {
          backgroundColor: '$pressHighlight',
        },
        pressStyle: {
          backgroundColor: '$pressHighlight',
        },
      },

      destructive: {
        backgroundColor: '$error',
        hoverStyle: {
          opacity: 0.9,
        },
        pressStyle: {
          opacity: 0.8,
        },
      },

      success: {
        backgroundColor: '$success',
        hoverStyle: {
          opacity: 0.9,
        },
        pressStyle: {
          opacity: 0.8,
        },
      },
    },

    /**
     * Button sizes
     */
    size: {
      sm: {
        paddingHorizontal: '$3',
        paddingVertical: '$2',
        borderRadius: '$1',
      },

      md: {
        paddingHorizontal: '$4',
        paddingVertical: '$3',
        borderRadius: '$2',
      },

      lg: {
        paddingHorizontal: '$5',
        paddingVertical: '$4',
        borderRadius: '$3',
      },

      xl: {
        paddingHorizontal: '$6',
        paddingVertical: '$5',
        borderRadius: '$3',
      },
    },

    /**
     * Full width option
     */
    fullWidth: {
      true: {
        width: '100%',
      },
    },

    /**
     * Icon-only button (circular)
     */
    circular: {
      true: {
        borderRadius: '$full',
        paddingHorizontal: '$3',
        paddingVertical: '$3',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

/**
 * Button text styling
 */
const ButtonText = styled(Text, {
  name: 'ButtonText',

  color: '$color',
  fontWeight: '600',
  textAlign: 'center',

  variants: {
    size: {
      sm: {
        fontSize: '$3',
      },
      md: {
        fontSize: '$4',
      },
      lg: {
        fontSize: '$5',
      },
      xl: {
        fontSize: '$6',
      },
    },

    variant: {
      primary: {
        color: 'white',
      },
      secondary: {
        color: '$textPrimary',
      },
      ghost: {
        color: '$textPrimary',
      },
      destructive: {
        color: 'white',
      },
      success: {
        color: 'white',
      },
    },
  } as const,

  defaultVariants: {
    size: 'md',
    variant: 'primary',
  },
});

/**
 * Loading spinner for button
 */
const LoadingSpinner = styled(Stack, {
  width: 16,
  height: 16,
  borderRadius: '$full',
  borderWidth: 2,
  borderColor: 'transparent',
  borderTopColor: 'currentColor',
  animation: 'quick',
});

export type ButtonFrameProps = GetProps<typeof ButtonFrame>;
export type ButtonTextProps = GetProps<typeof ButtonText>;

export interface ButtonProps extends ButtonFrameProps {
  /** Button text content */
  children?: ReactNode;
  /** Loading state */
  loading?: boolean;
  /** Icon to show before text */
  icon?: ReactNode;
  /** Icon to show after text */
  iconAfter?: ReactNode;
}

/**
 * Button component with text, icons, and loading state
 */
export function Button({
  children,
  loading,
  icon,
  iconAfter,
  disabled,
  variant = 'primary',
  size = 'md',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <ButtonFrame
      disabled={isDisabled}
      variant={variant}
      size={size}
      opacity={isDisabled ? 0.5 : 1}
      {...props}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon}
          {children && (
            <ButtonText variant={variant} size={size}>
              {children}
            </ButtonText>
          )}
          {iconAfter}
        </>
      )}
    </ButtonFrame>
  );
}

// Export frame for composition
Button.Frame = ButtonFrame;
Button.Text = ButtonText;

export { ButtonFrame, ButtonText };
