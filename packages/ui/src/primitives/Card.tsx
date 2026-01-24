/**
 * Card primitive component
 *
 * A container with elevation, borders, and padding.
 * Used as the base for exercise cards, stat displays, and content sections.
 */

import { styled, Stack, GetProps } from 'tamagui';

/**
 * Base card container
 */
export const Card = styled(Stack, {
  name: 'Card',

  backgroundColor: '$card',
  borderRadius: '$3',
  borderWidth: 1,
  borderColor: '$border',
  padding: '$4',

  // Animation for press states
  animation: 'quick',

  variants: {
    /**
     * Card variants
     */
    variant: {
      default: {
        backgroundColor: '$card',
        borderColor: '$border',
      },

      elevated: {
        backgroundColor: '$card',
        borderColor: 'transparent',
        shadowColor: '$shadowColor',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },

      outlined: {
        backgroundColor: 'transparent',
        borderColor: '$border',
        borderWidth: 1,
      },

      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        padding: 0,
      },

      interactive: {
        backgroundColor: '$card',
        borderColor: '$border',
        cursor: 'pointer',
        hoverStyle: {
          backgroundColor: '$cardHover',
          borderColor: '$borderHover',
        },
        pressStyle: {
          scale: 0.98,
          opacity: 0.9,
        },
      },

      active: {
        backgroundColor: '$card',
        borderColor: '$primary',
        borderWidth: 2,
      },

      success: {
        backgroundColor: '$successBackground',
        borderColor: '$successBorder',
      },

      warning: {
        backgroundColor: '$warningBackground',
        borderColor: '$warningBorder',
      },

      error: {
        backgroundColor: '$errorBackground',
        borderColor: '$errorBorder',
      },
    },

    /**
     * Card sizes (padding)
     */
    size: {
      sm: {
        padding: '$2',
        borderRadius: '$2',
      },

      md: {
        padding: '$4',
        borderRadius: '$3',
      },

      lg: {
        padding: '$6',
        borderRadius: '$4',
      },
    },

    /**
     * Horizontal layout
     */
    horizontal: {
      true: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    },

    /**
     * Full width
     */
    fullWidth: {
      true: {
        width: '100%',
      },
    },

    /**
     * Pressable state
     */
    pressable: {
      true: {
        cursor: 'pointer',
        hoverStyle: {
          backgroundColor: '$cardHover',
        },
        pressStyle: {
          scale: 0.98,
          opacity: 0.9,
        },
      },
    },
  } as const,

  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

export type CardProps = GetProps<typeof Card>;

/**
 * Card header section
 */
export const CardHeader = styled(Stack, {
  name: 'CardHeader',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: '$3',
  borderBottomWidth: 1,
  borderBottomColor: '$border',
  marginBottom: '$3',

  variants: {
    noBorder: {
      true: {
        borderBottomWidth: 0,
        marginBottom: 0,
      },
    },
  },
});

/**
 * Card body/content section
 */
export const CardBody = styled(Stack, {
  name: 'CardBody',

  flex: 1,
  gap: '$2',
});

/**
 * Card footer section
 */
export const CardFooter = styled(Stack, {
  name: 'CardFooter',

  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-end',
  paddingTop: '$3',
  borderTopWidth: 1,
  borderTopColor: '$border',
  marginTop: '$3',
  gap: '$2',

  variants: {
    noBorder: {
      true: {
        borderTopWidth: 0,
        marginTop: 0,
      },
    },

    spread: {
      true: {
        justifyContent: 'space-between',
      },
    },
  },
});
